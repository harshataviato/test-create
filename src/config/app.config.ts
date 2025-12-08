/**
 * Application-specific configuration settings.
 * This function loads general application parameters from environment variables or provides default values.
 * @returns An object containing application configuration.
 */
export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000, // Application port, defaults to 3000
  sessionSecret: process.env.SESSION_SECRET || 'super-secret-key', // Secret for session management
  // Add other application-wide settings here
});
