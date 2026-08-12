{
  pkgs,
  config,
  ...
}: {
  # https://devenv.sh/languages/
  languages.deno.enable = true;
  languages.nix = {
    enable = true;
    lsp.enable = true;
    lsp.package = pkgs.nil;
  };

  # https://devenv.sh/packages/
  packages = [pkgs.git];

  # https://devenv.sh/scripts/
  scripts.check.exec = "deno task check";

  # https://devenv.sh/basics/
  enterShell = ''
    echo "Welcome to rustify!"
  '';

  # https://devenv.sh/tests/
  enterTest = ''
    echo "Running tests"
    deno task check
  '';

  # https://devenv.sh/git-hooks/
  git-hooks.hooks = {
    alejandra.enable = true;
    deadnix.enable = true;
    denofmt = {
      enable = true;
      excludes = [".agents"];
    };
    denolint = {
      enable = true;
      excludes = [".agents"];
    };
    deno-check = {
      enable = true;
      name = "deno-check";
      entry = "${config.languages.deno.package}/bin/deno check src/ test/";
      files = "\\.(ts|json)$";
      pass_filenames = false;
      excludes = [".agents"];
    };
  };

  # See full reference at https://devenv.sh/reference/options/
}
