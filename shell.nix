{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  # 指定构建输入（依赖包）
  buildInputs = [
    pkgs.nodejs_22
    # npm 通常随 Node.js 一起安装，不需要单独指定
  ];

  # 设置环境变量（可选）
  shellHook = ''
    export PS1="''${debian_chroot:+($debian_chroot)}\[\033[01;32m\]nix-shell\[\033[00m\]:\[\033[01;34m\]\w\[\033[00m\]\$ "
  '';
}
