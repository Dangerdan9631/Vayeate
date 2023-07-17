# ------------------------------------------------------------------------------
#  <copyright file="env.blueshell.ps1" company="DangerDan9631">
#      Copyright (c) 2023 DangerDan9631. All rights reserved.
#      Licensed under the MIT License.
#      See https://opensource.org/licenses/MIT for full license information.
#  </copyright>
# ------------------------------------------------------------------------------

$rootDir = Split-Path -Path $PSScriptRoot -Parent
Set-ReadOnly "VayeateRoot" $rootDir
