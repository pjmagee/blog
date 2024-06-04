Title: Portable CI/CD with Dagger
Lead: CI/CD Pipelines with Dagger, containerised pipelines
Published: 2024-06-04
Tags:
  - Docker
  - CICD
  - Dagger
  - Github Actions
  - Gitlab CI
---

# Dagger CI/CD: A .NET CLI tool use-case

## Part 1: Understanding Heroes-Decode

Heroes-Decode stands as a powerful .NET CLI Tool meticulously crafted to parse .StormReplay files. Developed and maintained by HeroestoolChest, spearheaded by Kevin Oliva, this tool offers an indispensable utility for processing .StormReplay files.

Explore Heroes-Decode on GitHub: [HeroesDecode](https://github.com/HeroesToolChest/HeroesDecode)

## Part 2: Using Heroes-Decode in a Portable Manner

In the pursuit of flexibility and portability, it's essential to liberate our workflows from hard dependencies on .NET. 

Here's what that entails:

- **No .NET on Local Machine:** Striving to maintain a lean setup devoid of any .NET installations.
- **No .NET Requirement on CICD Runners:** Ensuring that CICD pipelines remain agnostic to .NET dependencies.
- **Embracing Portability:** Fostering an environment where the tool can seamlessly operate in a portable manner.
- **A portable container:** Unfortunately, Heroes-Decode lacks an official Docker image.

## Part 3: Evaluating Available Options

Given the circumstances, various paths present themselves:

- **Request Docker Image Support:** Advocating for the creation of an official Docker image.
- **Self-Sufficiency:** Leveraging personal expertise to create and utilize a custom Docker image.
- **Forking and Cloning the Repository:** Resorting to a DIY approach by forking the repository, constructing a Docker image, and publishing it to Docker Hub.
- **Containerization:** Exploring alternative methods to containerize the application **_without relying on a Dockerfile_**.

## Part 4: Introducing Dagger CI/CD

- **Avoiding Dockerfiles:** Dagger CI/CD eliminates the need for Dockerfiles, offering a seamless containerization experience.
- **Creating an Independent Pipeline:** Run it on any CI/CD platform, be it GitHub Actions, GitLab CI, locally, or any other CI/CD platform.
- **Leveraging built-in Dagger features:** Utilizing Dagger's built-in functions to streamline the process of containerizing Heroes-Decode.
- **Client/Host and Engine communciation:** Dagger's client/host communication ensures that the pipeline remains efficient and effective. 

The Heroes-Decode dagger module, published on the [Daggerverse](https://daggerverse.dev/mod/github.com/pjmagee/dagger-heroes-decode@c8b57e0edd4176393468e1dbcf5871ca6bc84b04).

With Dagger CI/CD, the process of containerizing Heroes-Decode becomes a breeze, offering a seamless and efficient experience.

## Part 5: Dagger breakdown

What is it composed of?

- **Dagger CLI:** A CLI tool that communicates with the Dagger Engine (a containerized service that runs on Containerd/Docker).
- **Dagger Engine:** A containerized service that executes the Dagger CLI commands.
- **Dagger Modules:** Reusable modules that encapsulate the logic. These modules can be published on the Daggerverse.
- **The Dagger API:** GraphQL API that allows developers to interact with the Dagger Engine.
- **Dagger SDK:** A language SDK used to communicate to the Dagger Engine via the GraphQL API, which allows developers to create unique, portable CI/CD Pipelines in a supported language (Go, Python, TypesScript).
- **Daggerverse:** A repository of Dagger modules that can be utilized to streamline the CI/CD process.


## Part 6: Breaking down the Heroes-Decode Dagger Module

This code is a Dagger module for the Heroes Decode tool by HeroesToolChest, which decodes Heroes of the Storm replay files. It's written in Go and uses the Dagger SDK to define a containerized environment for running the Heroes Decode tool. Here's a breakdown of the code:
Package and Imports: The code starts by defining the package name and importing necessary packages. The context package is a standard Go package for managing context, while the dagger package is specific to the Dagger SDK.

```go
package main

import (
	"context"
	"dagger/dagger-heroes-decode/internal/dagger"
	"fmt"
)
```
DaggerHeroesDecode Struct: This struct is the main component of the Dagger module. It doesn't have any fields, as its purpose is to provide methods for running the Heroes Decode tool.

```go
type DaggerHeroesDecode struct {
}
```
Decode Method: This method is where the main logic of the module resides. It takes a context, a file, and an array of additional arguments. It returns a Container object and an error.

```go
func (m *DaggerHeroesDecode) Decode(
	ctx context.Context,
	// +optional
	// The replay file to decode
	file *dagger.File,
	// +optional
	// Additional arguments to pass to the decoder
	args []string,

) (*Container, error) {
```
Repository and Directory Setup: The method starts by defining the Git repository of the Heroes Decode tool and the directory where the tool's code resides. It also specifies the version of the tool to use.

```go
repo := dag.Git("https://github.com/HeroesToolChest/HeroesDecode.git")
dir := repo.Tag("v1.4.0").Tree()
```

Container Setup: Two containers are defined: one for building the Heroes Decode tool and one for running it. The build container uses the .NET SDK, while the app container uses the .NET runtime. The build container compiles the Heroes Decode tool, and the app container runs the compiled tool.

```go
build := dag.Container().
		From("mcr.microsoft.com/dotnet/sdk:8.0").
		WithWorkdir("/app").
		WithDirectory("/app", dir.Directory("HeroesDecode")).
		WithExec([]string{"dotnet", "publish", "-c", "Release"})

app := dag.Container().
		From("mcr.microsoft.com/dotnet/runtime:8.0").
		WithWorkdir("/app").
		WithDirectory("/app", build.Directory("/app/bin/Release/net8.0/publish"))
```

Command Setup: The command to run the Heroes Decode tool is defined. If a file is provided, it's added to the command. If additional arguments are provided, they're also added to the command.

```go
cmd := []string{"./HeroesDecode"}

if file != nil {
	replay := []string{"--replay-path", replayPath}
	app.WithFile(replayPath, file)
	cmd = append(cmd, replay...)
}

if args != nil {
	cmd = append(cmd, args...)
}
```

Container Execution: Finally, the app container is set to execute the command and sync with the context.

```go
return app.
		WithExec(cmd).
		Sync(ctx)
}
```

## Part 7: Using the Dagger module

```bash
dagger -m github.com/pjmagee/dagger-heroes-decode@v1.0.0 call decode -h
```

```cmd
USAGE
  dagger call decode [arguments] <function>

FUNCTIONS
  as-service                    Turn the container into a Service.
  as-tarball                    Returns a File representing the container serialized to a tarball.
  build                         Initializes this container from a Dockerfile build.
  default-args                  Retrieves default arguments for future commands.
  directory                     Retrieves a directory at the given path.
  entrypoint                    Retrieves entrypoint to be prepended to the arguments of all commands.
  env-variable                  Retrieves the value of the specified environment variable.
  env-variables                 Retrieves the list of environment variables passed to commands.
  experimental-with-all-gp-us   EXPERIMENTAL API! Subject to change/removal at any time.
  experimental-with-gpu         EXPERIMENTAL API! Subject to change/removal at any time.
  export                        Writes the container as an OCI tarball to the destination file path on the host.
  exposed-ports                 Retrieves the list of exposed ports.
  file                          Retrieves a file at the given path.
  from                          Initializes this container from a pulled base image.
  image-ref                     The unique image reference which can only be retrieved immediately after the
                                'Container.From' call.
  import                        Reads the container from an OCI tarball.
  label                         Retrieves the value of the specified label.
  labels                        Retrieves the list of labels passed to container.
  mounts                        Retrieves the list of paths where a directory is mounted.
  pipeline                      Creates a named sub-pipeline.
  platform                      The platform this container executes and publishes as.
  publish                       Publishes this container as a new image to the specified address.
  rootfs                        Retrieves this container's root filesystem. Mounts are not included.
  stderr                        The error stream of the last executed command.
  stdout                        The output stream of the last executed command.
  sync                          Forces evaluation of the pipeline in the engine.
  terminal                      Return an interactive terminal for this container using its configured default terminal
                                command if not overridden by args (or sh as a fallback default).
  user                          Retrieves the user to be set for all commands.
  with-default-args             Configures default arguments for future commands.
  with-default-terminal-cmd     Set the default command to invoke for the container's terminal API.
  with-directory                Retrieves this container plus a directory written at the given path.
  with-entrypoint               Retrieves this container but with a different command entrypoint.
  with-env-variable             Retrieves this container plus the given environment variable.
  with-exec                     Retrieves this container after executing the specified command inside it.
  with-exposed-port             Expose a network port.
  with-file                     Retrieves this container plus the contents of the given file copied to the given path.
  with-files                    Retrieves this container plus the contents of the given files copied to the given path.
  with-focus                    Indicate that subsequent operations should be featured more prominently in the UI.
  with-label                    Retrieves this container plus the given label.
  with-mounted-cache            Retrieves this container plus a cache volume mounted at the given path.
  with-mounted-directory        Retrieves this container plus a directory mounted at the given path.
  with-mounted-file             Retrieves this container plus a file mounted at the given path.
  with-mounted-secret           Retrieves this container plus a secret mounted into a file at the given path.
  with-mounted-temp             Retrieves this container plus a temporary directory mounted at the given path. Any
                                writes will be ephemeral to a single withExec call; they will not be persisted to
                                subsequent withExecs.
  with-new-file                 Retrieves this container plus a new file written at the given path.
  with-registry-auth            Retrieves this container with a registry authentication for a given address.
  with-rootfs                   Retrieves the container with the given directory mounted to /.
  with-secret-variable          Retrieves this container plus an env variable containing the given secret.
  with-service-binding          Establish a runtime dependency on a service.
  with-user                     Retrieves this container with a different command user.
  with-workdir                  Retrieves this container with a different working directory.
  without-default-args          Retrieves this container with unset default arguments for future commands.
  without-directory             Retrieves this container with the directory at the given path removed.
  without-entrypoint            Retrieves this container with an unset command entrypoint.
  without-env-variable          Retrieves this container minus the given environment variable.
  without-exposed-port          Unexpose a previously exposed port.
  without-file                  Retrieves this container with the file at the given path removed.
  without-focus                 Indicate that subsequent operations should not be featured more prominently in the UI.
  without-label                 Retrieves this container minus the given environment label.
  without-mount                 Retrieves this container after unmounting everything at the given path.
  without-registry-auth         Retrieves this container without the registry authentication of a given address.
  without-secret-variable       Retrieves this container minus the given environment variable containing the secret.
  without-unix-socket           Retrieves this container with a previously added Unix socket removed.
  without-user                  Retrieves this container with an unset command user.
  without-workdir               Retrieves this container with an unset working directory.
  workdir                       Retrieves the working directory for all commands.

ARGUMENTS
      --args strings   Additional arguments to pass to the decoder
      --file File      The replay file to decode
```

Example usage

```sh
C:\Projects\pjmagee\dagger-heroes-decode [main ≡ +0 ~1 -0 !]> dagger call decode --file='C:\Users\patri\2024-06-04 17.49.26 Hanamura Temple.StormReplay' stdout
Success
 File Name: 2024-06-04T18_41_07.762628899Z.StormReplay
 Game Mode: QuickMatch
       Map: Hanamura Temple [Hanamura]
   Version: 2.55.5.92264
    Region: EU
 Game Time: 00:16:48
     Lobby: Standard
Ready Mode: FCFS
First Drft: CoinToss
  Ban Mode: NotUsingBans
   Privacy: Normal
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Team Blue (Winner)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
[-]   Player: Heartyfellow#
Player Level: 1383
 Player Toon: 2-Hero-1-7405397
   Hero Name: Xul [HeroNecromancer]
  Hero Level: 25
       Award: MostRoots

[-]   Player: Jamal#2101
Player Level: 1284
 Player Toon: 2-Hero-1-1870498
   Hero Name: Samuro [HeroSamuro]
  Hero Level: 6
       Award: MostMercCampsCaptured

[-]   Player: Winer#
Player Level: 436
 Player Toon: 2-Hero-1-7066747
   Hero Name: Sgt. Hammer [HeroSgtHammer]
  Hero Level: 75
       Award: MostHeroDamageDone

[-]   Player: pikkis23#
Player Level: 1260
 Player Toon: 2-Hero-1-13136396
   Hero Name: Junkrat [HeroJunkrat]
  Hero Level: 75
       Award: MVP

[-]   Player: Dota2Refugee#
Player Level: 266
 Player Toon: 2-Hero-1-13944224
   Hero Name: Malfurion [HeroMalfurion]
  Hero Level: 25

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Team Red
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
[5]   Player: DukeFleed#
Player Level: 779
 Player Toon: 2-Hero-1-1949829
   Hero Name: Alarak [HeroAlarak]
  Hero Level: 100

[5]   Player: skitzo#
Player Level: 200
 Player Toon: 2-Hero-1-13583013
   Hero Name: Rehgar [HeroRehgar]
  Hero Level: 20

[6]   Player: Quant#
Player Level: 3608
 Player Toon: 2-Hero-1-2214388
   Hero Name: Abathur [HeroAbathur]
  Hero Level: 100
       Award: MostSiegeDamageDone

[6]   Player: Caipa2mic#
Player Level: 1299
 Player Toon: 2-Hero-1-12625530
   Hero Name: Li-Ming [HeroWizard]
  Hero Level: 100

[6]   Player: Qlark#
Player Level: 707
 Player Toon: 2-Hero-1-13849640
   Hero Name: Genji [HeroGenji]
  Hero Level: 20

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Observers
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
(NONE)

C:\Projects\pjmagee\dagger-heroes-decode [main ≡ +0 ~1 -0 !]>

```

## Part 8: Conclusion

Dagger CI/CD offers a revolutionary approach to containerization, eliminating the need for Dockerfiles and providing a seamless experience. With the Heroes-Decode Dagger module, it's callable by anyone with the Dagger CLI, offering a portable and efficient solution for those who do not wish to install .NET and want to run the Heroes-Decode tool in a containerized environment.

The Heroes-Decode Dagger module is available on the [Daggerverse](https://daggerverse.dev/mod/github.com/pjmagee/dagger-heroes-decode@c8b57e0edd4176393468e1dbcf5871ca6bc84b04), enabling users to leverage the power of Dagger CI/CD for their containerization needs.