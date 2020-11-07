export class ModulesHolder {
  private static gqlModule;

  static setGqlModule = gqlModule => (ModulesHolder.gqlModule = gqlModule);
  static getGqlModule = () => ModulesHolder.gqlModule;
}
