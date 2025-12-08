from constance import config

from recipes.fdc.api import FdcApi


def get_api():
    return FdcApi(config.FDC_API_KEY)
