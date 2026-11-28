#!/usr/bin/env bash
# Roda só os testes que NÃO dependem da chave do gabarito (GABARITO_CHAVE).
# Usado no CI enquanto o segredo GABARITO_CHAVE não estiver configurado no GitHub.
set -euo pipefail
PULAR='auditoria|bdMissions|consoleMissions|desvCasos|gabaritoProtegido|infoMissions|linuxMissions|missions|rpgConsoleMissions|rpgMissions|turmasAppsScript|webMissions|desvServidor|sqlSeed|validation'
arquivos=$(git ls-files 'src/**/*.test.ts' | grep -Ev "/(${PULAR})\.test\.ts$")
# shellcheck disable=SC2086
node --import tsx --test $arquivos
