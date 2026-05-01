#!/usr/bin/env bash

# Try to detect host IP (same logic as your Makefile)
DETECTED_HOST=$(ip route get 1.1.1.1 2>/dev/null | awk 'NR==1 {
  for(i=1;i<=NF;i++) {
    if ($i=="src") {
      print $(i+1);
      exit
    }
  }
}')

# Use detected host or fallback to localhost
HOST="${HOST:-${DETECTED_HOST:-localhost}}"

export HOST

# Optional: print it (useful for debugging)
echo "HOST=$HOST"
