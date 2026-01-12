import html2canvas from "html2canvas"
import jsPDF from "jspdf"

export interface CertificateData {
  recipientName: string
  courseName: string
  description?: string
  completionDate?: string
  certificateType?: "completion" | "participation" | "achievement"
  founderSignature?: string
  cofounderSignature?: string
}

export async function downloadCertificate(data: CertificateData) {
  try {
    console.log("Starting certificate download process...")

    // Find the certificate element
    const certificateElement = document.getElementById("certificate")
    if (!certificateElement) {
      throw new Error("Certificate element not found")
    }

    // Store original styles
    const originalStyles = {
      position: certificateElement.style.position,
      top: certificateElement.style.top,
      left: certificateElement.style.left,
      zIndex: certificateElement.style.zIndex,
      transform: certificateElement.style.transform,
      scale: certificateElement.style.scale,
    }

    // Use fixed width and dynamic height as in Classic template
    const certWidth = 1000
    const certHeight = Math.max(700, certificateElement.scrollHeight)

    // Temporarily modify the original element for capture
    certificateElement.style.position = "fixed"
    certificateElement.style.top = "0"
    certificateElement.style.left = "0"
    certificateElement.style.zIndex = "9999"
    certificateElement.style.transform = "none"
    certificateElement.style.scale = "1"
    certificateElement.style.width = certWidth + "px"
    certificateElement.style.height = certHeight + "px"
    certificateElement.style.backgroundColor = "#ffffff"
    certificateElement.style.visibility = "visible"
    certificateElement.style.opacity = "1"
    certificateElement.style.display = "block"
    certificateElement.style.overflow = "visible"

    console.log("Temporary container created, waiting for render...")

    // Wait for fonts and images to load
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Ensure all images are loaded
    const images = certificateElement.querySelectorAll('img')
    const imagePromises = Array.from(images).map((img: HTMLImageElement) => {
      return new Promise((resolve) => {
        if (img.complete) {
          resolve(true)
        } else {
          img.onload = () => resolve(true)
          img.onerror = () => resolve(true) // Continue even if image fails
        }
      })
    })
    await Promise.all(imagePromises)

    // Force a reflow to ensure all styles are applied
    certificateElement.offsetHeight

    console.log("Generating canvas...")

    // Generate canvas with high quality settings
    const canvas = await html2canvas(certificateElement, {
      scale: 2, // Reduced scale to avoid memory issues
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      width: certWidth,
      height: certHeight,
      logging: true, // Enable logging to debug
      foreignObjectRendering: false, // Disable to avoid issues
      removeContainer: false,
      imageTimeout: 15000,
    })

    console.log("Canvas generated successfully, dimensions:", canvas.width, "x", canvas.height)
    
    // Debug: Check if canvas has content
    const ctx = canvas.getContext('2d')
    const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height)
    const hasContent = imageData?.data.some((value, index) => {
      // Check if any pixel is not white (255, 255, 255) or transparent (0)
      if (index % 4 === 3) return false // Skip alpha channel
      return value !== 255 && value !== 0
    })
    console.log("Canvas has content:", hasContent)
    
    if (!hasContent) {
      console.warn("Canvas appears to be blank! This might be a rendering issue.")
    }

    // Restore original styles
    certificateElement.style.position = originalStyles.position
    certificateElement.style.top = originalStyles.top
    certificateElement.style.left = originalStyles.left
    certificateElement.style.zIndex = originalStyles.zIndex
    certificateElement.style.transform = originalStyles.transform
    certificateElement.style.scale = originalStyles.scale
    certificateElement.style.width = ""
    certificateElement.style.height = ""
    certificateElement.style.backgroundColor = ""
    certificateElement.style.visibility = ""
    certificateElement.style.opacity = ""
    certificateElement.style.display = ""
    certificateElement.style.overflow = ""

    // Create PDF with custom dimensions maintaining certificate's natural proportions
    console.log("Canvas dimensions:", canvas.width, "x", canvas.height)
    const certificateAspectRatio = canvas.width / canvas.height
    console.log("Certificate aspect ratio:", certificateAspectRatio)
    
    // Use A4-like dimensions but maintain aspect ratio
    const pageWidth = 210  // A4 width in mm
    const calculatedHeight = pageWidth / certificateAspectRatio
    const pageHeight = Math.round(calculatedHeight)
    
    console.log("Page width:", pageWidth, "mm")
    console.log("Calculated height:", calculatedHeight, "-> Rounded:", pageHeight, "mm")
    
    // Create PDF with explicit custom format
    const pdf = new jsPDF({
      orientation: pageWidth > pageHeight ? "landscape" : "portrait",
      unit: "mm",
      format: [pageWidth, pageHeight],
      compress: true
    })
    
    console.log("PDF created with format:", [pageWidth, pageHeight])

    // Convert canvas to high-quality image data
    const imgData = canvas.toDataURL('image/jpeg', 0.95)
    
    // Fill page with certificate maintaining natural proportions
    const imgWidth = pageWidth
    const imgHeight = pageHeight
    const xOffset = 0
    const yOffset = 0

    console.log("Adding image to PDF with dimensions:", imgWidth, "x", imgHeight)

    // Add image to PDF
    pdf.addImage(imgData, "JPEG", xOffset, yOffset, imgWidth, imgHeight, undefined, "FAST")

    // Generate filename
    const sanitizedName = data.recipientName.replace(/[^a-zA-Z0-9]/g, "_")
    const sanitizedCourse = data.courseName.replace(/[^a-zA-Z0-9]/g, "_")
    const timestamp = new Date().getTime()
    const filename = `${sanitizedName}_${sanitizedCourse}_Certificate_${timestamp}.pdf`

    console.log("Saving PDF as:", filename)

    // Save the PDF
    pdf.save(filename)

    console.log("Certificate downloaded successfully!")
    return true
  } catch (error) {
    console.error("Error generating certificate:", error)
    
    // Restore original styles in case of error
    const certificateElement = document.getElementById("certificate")
    if (certificateElement) {
      certificateElement.style.position = ""
      certificateElement.style.top = ""
      certificateElement.style.left = ""
      certificateElement.style.zIndex = ""
      certificateElement.style.transform = ""
      certificateElement.style.scale = ""
      certificateElement.style.width = ""
      certificateElement.style.height = ""
      certificateElement.style.backgroundColor = ""
      certificateElement.style.visibility = ""
      certificateElement.style.opacity = ""
      certificateElement.style.display = ""
      certificateElement.style.overflow = ""
    }
    
    let message = "Unknown error"
    if (error instanceof Error) {
      message = error.message
    } else if (typeof error === "string") {
      message = error
    }
    throw new Error(`Failed to generate certificate: ${message}`)
  }
}
