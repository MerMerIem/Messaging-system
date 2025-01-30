{ pkgs, ... }: {
  # Specify the Nixpkgs channel
  channel = "stable-24.05";

  # Define the packages you need
  packages = [
    pkgs.mysql80
    pkgs.sudo
  ];

   # Enable the MySQL service
  services = {
    mysql = {
      enable = true;
      package = pkgs.mysql80;
    };
   };

  # Set environment variables if needed
  env = {
  };

  # Set environment variables if needed
  env = {};

  idx = {
    # Define any extensions you require
    extensions = [
      # Example: "vscodevim.vim"
    ];

    # Enable previews
    previews = {
      enable = true;
      previews = {
        # web = {
        #   # Example: run "npm run dev" with PORT set to IDX's defined port for previews,
        #   # and show it in IDX's web preview panel
        #   command = ["npm" "run" "dev"];
        #   manager = "web";
        #   env = {
        #     # Environment variables to set for your server
        #     PORT = "$PORT";
        #   };
        # };
      };
    };

    # Workspace lifecycle hooks
    workspace = {
      # Runs when a workspace is first created
      onCreate = {
        # Example: install JS dependencies
        # npm-install = "npm install";
      };
      # Runs when the workspace is (re)started
      onStart = {
        # Example: start a background task
        # watch-backend = "npm run watch-backend";
      };
    };
  };
}
