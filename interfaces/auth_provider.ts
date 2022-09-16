export default interface AuthProvider {
  getToken: () => Promise<string>;
}
