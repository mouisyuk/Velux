import { layoutServiceFactory } from './layout-service-factory';

export function createLayoutServiceClient(config, { nuxtContext } = {}) {
  const layoutServiceInstance = layoutServiceFactory.create();

  return {
    getRouteData: (route, language) => getRouteData(route, language, config, nuxtContext, layoutServiceInstance),
  };
}

function getRouteData(route, language, config, nuxtContext, layoutServiceInstance) {
  const fetchOptions = {
    // NOTE: we want to proxy client-side layout service requests through the Nuxt server so
    // that cookies are properly maintained. Therefore, we set the Layout Service
    // config `host` value to empty when in a client context.
    // The Nuxt server or hosting platform (for static sites) will then handle requests for `/sitecore/api/layout/...`
    layoutServiceConfig: { host: process.client ? '' : config.sitecoreApiHost },
    querystringParams: {
      sc_lang: language,
      sc_apikey: config.sitecoreApiKey,
      sc_site: config.sitecoreSiteName,
    },
    fetcher: nuxtContext.$axios,
  };

  // NOTE: using `!process.client` will help ensure dead code elimination during minification for the client bundle.
  if (
    !process.client &&
    nuxtContext?.app?.context?.isStatic &&
    nuxtContext?.app?.getExportRouteDataContext
  ) {
    // export mode
    // Fetch layout data from Layout Service, then write the data to disk.
    const { exportRouteDataWriter } = nuxtContext.app.getExportRouteDataContext();
    let apiData;
    return fetchFromApi(route, fetchOptions, layoutServiceInstance)
      .then((data) => {
        apiData = data;
        return exportRouteDataWriter(route, language, data);
      })
      .then(() => apiData);
  } else if (process.env.NODE_ENV === 'production') {
    // If we're in production mode and not running a static site, then fetch directly from API.
    if (!process.static) {
      return fetchFromApi(route, fetchOptions, layoutServiceInstance);
    }
    // production mode (i.e. the app is "running" somewhere)
    // Attempt to fetch layout data from disk, and fall back to Layout Service if disk fetch returns 404.
    return fetchFromDisk(route, language, fetchOptions.fetcher).catch((err) => {
      if (err.response && err.response.status === 404) {
        return fetchFromApi(route, fetchOptions, layoutServiceInstance);
      }
      console.error(err);
    });
  } else {
    // development mode
    // Fetch layout data from Layout Service
    return fetchFromApi(route, fetchOptions, layoutServiceInstance);
  }
}

// note: if `str` is undefined, no leading slash will be applied/returned.
function ensureLeadingSlash(str) {
  if (str && !str.startsWith('/')) {
    return `/${str}`;
  }
  return str;
}

function fetchFromDisk(route, language, dataFetcher) {
  let formattedRoute = ensureLeadingSlash(route);
  if (formattedRoute === '/') {
    formattedRoute = '/home';
  }

  const filePath = `/data${formattedRoute}/${language}.json`;
  return dataFetcher(filePath).then((response) => {
    // note: `dataFetcher` returns the parsed response, but we're only interested in
    // the `data` property, which is what is returned by the `dataApi.fetchRouteData` function.
    return response.data;
  });
}

function fetchFromApi(route, fetchOptions, layoutServiceInstance) {
  // Layout Service may resolve items (routes) incorrectly without a leading slash. This is
  // particularly true for nested routes, e.g. home/sub1/sub2/sub3. Therefore, we ensure
  // that the item/route being requested has a leading slash.
  const formattedRoute = ensureLeadingSlash(route);

  return layoutServiceInstance.fetchLayoutData(formattedRoute);
}
