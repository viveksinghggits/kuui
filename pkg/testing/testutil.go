package util

import (
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/tools/clientcmd"
	"k8s.io/klog"
)

func loadConfig(configPath string) *kubernetes.Clientset{
	config, err := clientcmd.BuildConfigFromFlags("", configPath)
	if err != nil {
		klog.Fatalf("Error while building config from flag: %s", err.Error())
	}
	kubeclient, err := kubernetes.NewForConfig(config)
	if err != nil {
		klog.Fatalf("Error while getting clientset from config: %s", err.Error())
	}
	return kubeclient
}