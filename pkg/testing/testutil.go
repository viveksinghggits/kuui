package util

import (
	"fmt"
	"os"

	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/tools/clientcmd"
	"k8s.io/klog"
)

func loadConfig(configPathSuffix string) *kubernetes.Clientset {
	home, ok := os.LookupEnv("HOME")
	if !ok {
		return nil
	}

	config, err := clientcmd.BuildConfigFromFlags("", fmt.Sprintf("%s%s", home, configPathSuffix))
	if err != nil {
		klog.Fatalf("Error while building config from flag: %s", err.Error())
	}
	kubeclient, err := kubernetes.NewForConfig(config)
	if err != nil {
		klog.Fatalf("Error while getting clientset from config: %s", err.Error())
	}
	return kubeclient
}
