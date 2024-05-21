require("dotenv").config();
const routes = require("./src/routes");

const lti = require("ltijs").Provider;

// Setup
lti.setup(
  process.env.LTI_KEY,
  {
    url: process.env.AZURE_COSMOS_CONNECTIONSTRING,
  },
  {
    cookies: {
      secure: true, // Set secure to true if the testing platform is in a different domain and https is being used
      sameSite: "None", // Set sameSite to 'None' if the testing platform is in a different domain and https is being used
      domain: ".azurewebsites.net",
    },
    devMode: false, // Set DevMode to true if the testing platform is in a different domain and https is not being used
    // ltiaas: true,
  }
);

// When receiving successful LTI launch redirects to app
lti.onConnect(async (token, req, res) => {
  return lti.redirect(res, "https://game-virtudes.azurewebsites.net", { newResource: true });
});

// When receiving deep linking request redirects to deep screen
lti.onDeepLinking(async (token, req, res) => {
  return lti.redirect(res, "/deeplink", { newResource: true });
});

// Setting up routes
lti.app.use(routes);

// Setup function
const setup = async () => {
  await lti.deploy({ port: process.env.PORT });

  await lti.registerPlatform({
    url: process.env.PLATFORM_URL,
    name: "Canvas",
    clientId: process.env.PLATFORM_CLIENTID,
    authenticationEndpoint: process.env.PLATFORM_AUTH_ENDPOINT,
    accesstokenEndpoint: process.env.PLATFORM_TOKEN_ENDPOINT,
    authConfig: { method: "JWK_SET", key: process.env.PLATFORM_KEY_ENDPOINT },
  });
};

setup();
