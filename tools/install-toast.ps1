# tools/install-toast.ps1
# Instala BurntToast para notificações nativas do Windows

Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy Bypass -Force | Out-Null

# Confia no PSGallery se necessário
try {
 $repo = Get-PSRepository -Name "PSGallery" -ErrorAction Stop
 if ($repo.InstallationPolicy -ne "Trusted") {
   Set-PSRepository -Name "PSGallery" -InstallationPolicy Trusted
 }
} catch {
 # Ignora se não conseguir ler, segue para instalar
}

# Instala BurntToast (CurrentUser)
Install-Module -Name BurntToast -Scope CurrentUser -Force -AllowClobber
Write-Host "✅ BurntToast instalado. Você já pode rodar: pnpm watch:done" -ForegroundColor Green
