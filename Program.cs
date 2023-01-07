await Bootstrapper
    .Factory
    .CreateWeb(args)
    .DeployToGitHubPages(
        "pjmagee",
        "pjmagee.github.io",
        Config.FromSetting<string>("GITHUB_TOKEN")
    )
    .RunAsync();