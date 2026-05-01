#!bin/bash
_DETECTED_HOST := $(shell ip route get 1.1.1.1 2>/dev/null | awk 'NR==1{for(i=1;i<=NF;i++) if ($$i=="src") {print $$(i+1); exit}}')
HOST ?= $(or $(_DETECTED_HOST),localhost)
export HOST
