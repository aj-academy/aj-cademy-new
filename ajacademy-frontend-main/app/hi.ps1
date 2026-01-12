Write-Host "=== GPU Capability Report ===`n"

# Basic GPU Info
Get-WmiObject Win32_VideoController | ForEach-Object {
    Write-Host "GPU Name: $($_.Name)"
    Write-Host "Driver Version: $($_.DriverVersion)"
    Write-Host "VRAM: $([math]::Round($_.AdapterRAM / 1GB, 2)) GB"
    Write-Host "Video Processor: $($_.VideoProcessor)`n"
}

# NVIDIA-SMI Output (if available)
Write-Host "=== NVIDIA SMI Output ===`n"
try {
    nvidia-smi
} catch {
    Write-Host "nvidia-smi not found. Make sure NVIDIA drivers are installed."
}
