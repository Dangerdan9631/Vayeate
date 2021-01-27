# -----------------------------------------------------------------------------
#  <copyright file="example.ps1" company="DangerDan9631">
#      Copyright (c) 2021 DangerDan9631. All rights reserved.
#      Licensed under the MIT License.
#      See https://github.com/Dangerdan9631/Licenses/blob/main/LICENSE-MIT for full license information.
#  </copyright>
# -----------------------------------------------------------------------------

################################################################################
# Function in PowerShell
################################################################################
function Factorial-Of-A-Number([int]$number) {
    if($number -lt 0) {
        $factValue = 0
    } elseif($number -le 1) {
        $factValue = 1
    } else {
        $factValue = $number * (Get-Factorial($number - 1))
    }
    return $factValue
}

$number = Read-Host 'Enter a value'
$factValue = Factorial-Of-A-Number $number
Write-Output "$number! = $factValue"

################################################################################
# How to show a message box from PowerShell
################################################################################
$msgBoxInput = [System.Windows.MessageBox]:: Show('Would you like to exit the page','Leave the page or not','YesNoCancel','Error')
switch ($msgBoxInput) {
    'Yes' {
        Write-Host "You pressed yes"
    }
    'No' {
        Write-Host "You pressed No"
    }
    'Cancel' {
        Write-Host "You pressed cancel"
    }
}
################################################################################
# PowerShell Alias
################################################################################
New-Alias -Name PowerShellCommand -Value Get-Help
PowerShell command
################################################################################
# PowerShell Array
################################################################################
$NumberList = 1,2,3,4,5,6,7,8
write-host("Display all the Array element:")
$NumberList
write-host("Get the length of array:")
$NumberList.Length
write-host("Get fourth element of array")
$NumberList[3]
write-host("Get partial array")
$subList = $NumberList[1..3]
write-host("print subList")
$subList
write-host("using for loop")
for ($i = 0; $i -le ($NumberList.length - 1); $i += 1) {
$NumberList[$i]
}
write-host("Assign values")
$NumberList[1] = 10
$NumberList
