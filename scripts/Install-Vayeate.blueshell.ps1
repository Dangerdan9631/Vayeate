# ------------------------------------------------------------------------------
#  <copyright file="Install-Vayeate.blueshell.ps1" company="DangerDan9631">
#      Copyright (c) 2023 DangerDan9631. All rights reserved.
#      Licensed under the MIT License.
#      See https://opensource.org/licenses/MIT for full license information.
#  </copyright>
# ------------------------------------------------------------------------------

Function Install-Vayeate() {
    $currentLocation = $PWD.Path
    Set-Location -Path $VayeateRoot
    Invoke-BlueShellCommand "npm run install-extension"
    Set-Location -Path $currentLocation
}

Export-ModuleMember -Function 'Install-Vayeate'
