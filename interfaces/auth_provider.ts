export default interface IAuthProvider {
  getToken: () => Promise<string>;
}
