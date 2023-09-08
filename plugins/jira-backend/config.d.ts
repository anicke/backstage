export interface Config {
  /**
   * Configuration for the Jira backend.
   * @visibility backend
   */
  Jira: {
    /**
     * The base url of the Jira service. For example: https://jira.example.com/rest/api/2
     *
     * @visibility backend
     */
    baseUrl: string;

    /**
     * The access token..
     * @visibility secret
     */
    token: boolean;
  };
}
