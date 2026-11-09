"""Fetch source from a secret HTTPS URL; never expose URL/headers in logs."""
import hashlib
import os
from pathlib import Path
import re
import sys
import urllib.request
from urllib.parse import urlsplit

MAX_BYTES = 500 * 1024 * 1024

def validate_url(url, hosts):
    p = urlsplit(url)
    host = (p.hostname or '').lower()
    if (p.scheme != 'https' or p.username or p.password or p.fragment or
            p.port not in (None, 443) or not host or host not in hosts):
        raise ValueError('Source must use HTTPS and an explicitly allowed hostname')
    # Private endpoints / DNS rebinding are not a supported asset transport.
    import ipaddress
    import socket
    addresses = socket.getaddrinfo(host, 443, type=socket.SOCK_STREAM)
    if not addresses or any(not ipaddress.ip_address(x[4][0]).is_global for x in addresses):
        raise ValueError('Source hostname must resolve only to public IP addresses')

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        raise ValueError('Redirect not allowed; use the direct asset URL')

def fetch(destination):
    url = os.environ.get('VIDEO_QUALITY_SOURCE_URL', '')
    hosts = {h.strip().lower() for h in os.environ.get('VIDEO_QUALITY_ALLOWED_HOSTS', '').split(',') if h.strip()}
    expected = os.environ.get('VIDEO_QUALITY_SOURCE_SHA256', '').lower()
    if not re.fullmatch('[a-f0-9]{64}', expected):
        raise ValueError('VIDEO_QUALITY_SOURCE_SHA256 must be set')
    validate_url(url, hosts)
    dst = Path(destination)
    dst.parent.mkdir(parents=True, exist_ok=True)
    h, count = hashlib.sha256(), 0
    try:
        with urllib.request.build_opener(NoRedirect()).open(url, timeout=30) as response, dst.open('xb') as f:
            if int(response.headers.get('Content-Length', '0')) > MAX_BYTES:
                raise ValueError('Source too large')
            while True:
                block = response.read(1024 * 1024)
                if not block:
                    break
                count += len(block)
                if count > MAX_BYTES:
                    raise ValueError('Source too large')
                f.write(block)
                h.update(block)
        if not count or h.hexdigest() != expected:
            raise ValueError('Source fingerprint mismatch')
    except Exception:
        # Do not delete/overwrite a pre-existing file.
        raise
    return count

if __name__ == '__main__':
    try:
        print('Source downloaded, bytes=' + str(fetch(sys.argv[1])))
    except Exception:
        print('BLOCKED: source download failed. Check direct HTTPS URL, host allowlist, hash and size. URL omitted.', file=sys.stderr)
        sys.exit(1)
