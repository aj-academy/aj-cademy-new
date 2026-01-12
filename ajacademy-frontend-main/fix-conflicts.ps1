$conflictPattern = @"
<<<<<<< HEAD
(.*?)
=======
(.*?)
>>>>>>> 33a1fdd85e058d44ad90d7aae20f038bfe9234d3
"@

$files = Get-ChildItem -Path . -Recurse -File | Where-Object { 
    $_.Extension -match '\.(js|jsx|ts|tsx|css|scss|json|md)$' -and 
    $_.FullName -notmatch '(node_modules|\.git)' -and
    (Get-Content $_.FullName -Raw) -match $conflictPattern
}

Write-Host "Found $($files.Count) files with conflicts"

foreach ($file in $files) {
    Write-Host "Processing $($file.FullName)"
    
    $content = Get-Content $file.FullName -Raw
    
    # Replace conflict patterns with the content from the incoming branch (between ======= and >>>>>>>)
    while ($content -match $conflictPattern) {
        $fullMatch = $matches[0]
        $head = $matches[1]
        $incoming = $matches[2]
        
        # Keep the incoming changes (from branch 33a1fdd85e058d44ad90d7aae20f038bfe9234d3)
        $content = $content -replace [regex]::Escape($fullMatch), $incoming
    }
    
    # Write the file back
    Set-Content -Path $file.FullName -Value $content
    
    Write-Host "✅ Fixed $($file.Name)"
}

Write-Host "Done fixing conflicts" 