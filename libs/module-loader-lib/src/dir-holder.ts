export class DirHolder {
  private static projectDir: string;
  private static modulesDir: string;

  static setProjectDir = dir => (DirHolder.projectDir = dir);

  static getProjectDir = () => DirHolder.projectDir;

  static setModulesDir = dir => (DirHolder.modulesDir = dir);

  static getModulesDir = () => DirHolder.modulesDir;
}
