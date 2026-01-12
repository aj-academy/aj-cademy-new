"use client"

import { forwardRef } from "react"
import Image from "next/image"

export interface CertificateRenderData {
  recipientName: string
  courseName: string
  description?: string
  completionDate?: string
  certificateType?: "completion" | "participation" | "achievement"
  founderSignature?: string
  cofounderSignature?: string
}

interface ClassicTemplateProps {
  data: CertificateRenderData
}

export const ClassicTemplate = forwardRef<HTMLDivElement, ClassicTemplateProps>(({ data }, ref) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return ""
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getCertificateTitle = () => {
    switch (data.certificateType) {
      case "completion":
        return "CERTIFICATE OF COMPLETION"
      case "participation":
        return "CERTIFICATE OF PARTICIPATION"
      case "achievement":
        return "CERTIFICATE OF ACHIEVEMENT"
      default:
        return "CERTIFICATE"
    }
  }

  return (
    <div ref={ref} id="certificate" className="w-[1000px] min-h-[700px] relative bg-white overflow-hidden shadow-2xl rounded-xl py-16 flex flex-col justify-center">
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFF8E1] to-white" />

      <div className="absolute inset-4 border-4 border-[#D4AF37] rounded-xl" />
      <div className="absolute inset-8 border-2 border-[#BFA14A] rounded-lg" />

      {/* Left Garland */}
      <div className="absolute left-0 top-0 w-32 h-full flex items-center justify-center">
        <Image 
          src="/sb-12.png" 
          alt="Left Garland" 
          width={128} 
          height={700} 
          className="object-contain h-full w-auto" 
          priority 
        />
      </div>

      {/* Right Garland */}
      <div className="absolute right-0 top-0 w-32 h-full flex items-center justify-center">
        <Image 
          src="/sb-12.png" 
          alt="Right Garland" 
          width={128} 
          height={700} 
          className="object-contain h-full w-auto scale-x-[-1]" 
          priority 
        />
      </div>

      <div className="relative h-full flex flex-col items-center justify-center p-16 text-center">
        <div className="mb-8 flex flex-col items-center justify-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-40 h-40 flex items-center justify-center">
              <Image 
                src="/ajlogo.jpg" 
                alt="AJ Academy" 
                width={160} 
                height={160} 
                className="object-contain" 
                priority 
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div className="w-40 h-40 bg-blue-100 border-2 border-blue-300 rounded-lg flex items-center justify-center" style={{display: 'none'}}>
                <span className="text-blue-600 text-lg font-bold">AJ ACADEMY</span>
              </div>
            </div>
          </div>
          <div className="w-40 h-px bg-[#D4AF37] mx-auto" />
          <p className="text-sm text-gray-700 font-serif mt-2 tracking-widest">ACADEMIC EXCELLENCE</p>
        </div>

        <div className="mb-12">
          <h2 className="text-5xl font-serif font-bold text-gray-900 mb-2 tracking-wider drop-shadow">
            {getCertificateTitle()}
          </h2>
          <p className="text-lg text-gray-700 font-serif mb-4">Presented to</p>
          <div className="flex items-center justify-center space-x-4 mb-2">
            <div className="w-16 h-px bg-[#D4AF37]" />
            <div className="w-4 h-4 bg-[#D4AF37] rounded-full border-2 border-[#BFA14A]" />
            <div className="w-16 h-px bg-[#D4AF37]" />
          </div>
        </div>

        <div className="mb-12 space-y-6">
          <p className="text-2xl font-serif text-gray-900">This is to certify that</p>
          <h3 className="text-5xl font-serif font-bold text-gray-900 mb-6 italic drop-shadow">
            {data.recipientName || "[Recipient Name]"}
          </h3>
          <div className="flex justify-center mb-6">
            <svg width="250" height="15" viewBox="0 0 250 15" className="text-[#D4AF37]">
              <path d="M15 7 Q 125 3, 235 7" stroke="currentColor" strokeWidth="3" fill="none" />
              <path d="M20 10 Q 125 6, 230 10" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.6" />
            </svg>
          </div>

          <p className="text-2xl font-serif text-gray-900">
            has {data.certificateType === "participation" ? "participated in" : "successfully completed"}
          </p>

          <h4 className="text-3xl font-serif font-semibold text-gray-800 px-8 leading-relaxed">
            {data.courseName || "[Course/Event Name]"}
            {data.description && (
              <span className="text-xl font-serif text-gray-900 font-normal align-baseline"> {data.description}</span>
            )}
          </h4>

          {data.completionDate && (
            <p className="text-xl font-serif text-gray-900 mt-8">Given this {formatDate(data.completionDate)}</p>
          )}
        </div>

        <div className="mt-auto flex justify-between w-full items-end px-4">
          <div className="text-center">
            <div className="w-48 h-16 mb-2 flex items-end justify-center">
              {data.founderSignature ? (
                <img src={data.founderSignature} alt="Founder signature" className="h-12 max-w-40 object-contain" />
              ) : (
                <div className="text-3xl font-script text-gray-800 italic">Founder</div>
              )}
            </div>
            <div className="w-48 h-px bg-[#D4AF37] mb-4" />
            <p className="text-gray-900 font-serif font-semibold text-lg">Founder</p>
            <p className="text-gray-700 font-serif">AJ Academy</p>
          </div>

          <div className="flex-1 flex flex-col items-center justify-end">
            <div className="mb-4">
              <div className="w-40 h-40 bg-gray-100 border-2 border-gray-300 rounded-lg flex items-center justify-center">
                <span className="text-gray-500 text-sm font-semibold">MSME</span>
              </div>
              <p className="text-sm text-gray-700 mt-2 font-mono">UDYAM-TN-02-0405466</p>
            </div>
          </div>

          <div className="text-center">
            <div className="w-48 h-16 mb-2 flex items-end justify-center">
              {data.cofounderSignature ? (
                <img src={data.cofounderSignature} alt="Co-founder signature" className="h-12 max-w-40 object-contain" />
              ) : (
                <div className="text-3xl font-script text-gray-800 italic">Co-founder</div>
              )}
            </div>
            <div className="w-48 h-px bg-[#D4AF37] mb-4" />
            <p className="text-gray-900 font-serif font-semibold text-lg">Co-founder</p>
            <p className="text-gray-700 font-serif">AJ Academy</p>
          </div>
        </div>
      </div>
    </div>
  )
})

ClassicTemplate.displayName = "ClassicTemplate"


