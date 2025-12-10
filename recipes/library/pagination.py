from rest_framework.pagination import LimitOffsetPagination


class ProxiedLimitOffsetPagination(LimitOffsetPagination):
    """
    Pagination class that properly handles proxied requests by using
    X-Original-Host header for building next/previous URLs.
    """

    def get_next_link(self):
        url = super().get_next_link()
        return self._replace_host_in_url(url)

    def get_previous_link(self):
        url = super().get_previous_link()
        return self._replace_host_in_url(url)

    def _replace_host_in_url(self, url):
        """Replace the host in the URL with the proxied host if available"""
        if not url:
            return url

        request = self.request
        if request:
            # Try custom header first (not overwritten by OpenShift)
            # then fall back to X-Forwarded-Host
            original_host = request.META.get("HTTP_X_ORIGINAL_HOST")
            forwarded_host = request.META.get("HTTP_X_FORWARDED_HOST")
            host_to_use = original_host or forwarded_host

            if host_to_use:
                # Replace the host in the URL
                # URL format: scheme://host/path
                import re

                # Match the scheme and host portion
                url = re.sub(r"(https?://)([^/]+)", f"https://{host_to_use}", url)

        return url
