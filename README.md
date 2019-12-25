# KuUI (Kubernetes UI)
The main purpose of this application is to have a simple UI that can be used to manage the configmaps/secrets of your Kubernetes cluster. 

# Installation

To use this project either you can build it from source or download the binaries.

## Build it from source

To build the project from source, please clone it on your machine using below command

```
git clone https://github.com/viveksinghggits/kuui.git
```

and you can build the project using the command `go mod -o kuui`. Optionally you can move the created binary
into your path so that you can use this from whereever you want.

### Running it

To run the project you just have to execute the `kuui` binary by providing it the kubeconfig file. Like below
```
./kuui --kubeconfig=$HOME/.kube/config
# or whereever you kubeconfig file is
```

To access the UI you will just have to open the index.html file and make sure that the correct endpoint is entered
in the index.js at [line 1](https://github.com/viveksinghggits/kuui/blob/master/web/index.js#L1).


![Demo](docs/cm-secret-final.gif)


## RoadMap

* Support for creation and deletion of the CM and Secret resource

**Note**
I recently started working on this and would love to hear your inputs/feedback, please feel free to raise an issue 
or open a PR.