package util

import (
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/klog"
)

func ListConfigMaps(kubeclient *kubernetes.Clientset) []corev1.ConfigMap {

	configMapList, err := kubeclient.CoreV1().ConfigMaps("").List(metav1.ListOptions{})
	if err != nil {
		klog.Fatalf("Error while listing all the configmaps: %s", err.Error())
	}

	return configMapList.Items
}

func GetConfigMap(kubeclient *kubernetes.Clientset, cmns, cmName string) corev1.ConfigMap {
	cm, err := kubeclient.CoreV1().ConfigMaps(cmns).Get(cmName, metav1.GetOptions{})
	if err != nil {
		klog.Fatalf("Error while getting a configmap: %s", err.Error())
	}
	return *cm
}

func UpdateConfigMap(kubeclient *kubernetes.Clientset, cmns, cmName string, configmap corev1.ConfigMap) *corev1.ConfigMap {
	klog.Infof("UpdateConfigmap was called with %+v", configmap)
	cm, err := kubeclient.CoreV1().ConfigMaps(cmns).Update(&configmap)
	if err != nil {
		klog.Fatalf("Error while updating the configmap: %s", err.Error())
	}
	return cm
}
