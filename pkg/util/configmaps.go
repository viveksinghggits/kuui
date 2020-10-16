package util

import (
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/klog"
)

// ListConfigMaps returns list of ConfigMap from all the namespaces
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
	cm, err := kubeclient.CoreV1().ConfigMaps(cmns).Update(&configmap)
	if err != nil {
		klog.Fatalf("Error while updating the configmap: %s", err.Error())
	}
	return cm
}

func GetNamespaces(kubeclient *kubernetes.Clientset) []corev1.Namespace {
	allNamespaces, err := kubeclient.CoreV1().Namespaces().List(metav1.ListOptions{})
	if err != nil {
		klog.Fatalf("Error while getting all the NSs %s", err.Error())
	}
	return allNamespaces.Items
}

func GetConfigMapsOfNS(kubeclient *kubernetes.Clientset, namespace string) []corev1.ConfigMap {
	configMaps, err := kubeclient.CoreV1().ConfigMaps(namespace).List(metav1.ListOptions{})
	if err != nil {
		klog.Fatalf("Error while listing all CMs of a NS %s", err.Error())
	}
	return configMaps.Items
}

func DeleteConfigMap(kubeclient *kubernetes.Clientset, namespace, name string) error {
	return kubeclient.CoreV1().ConfigMaps(namespace).Delete(name, &metav1.DeleteOptions{})
}

func CreateConfigMap(kubeclient *kubernetes.Clientset, cm corev1.ConfigMap) error {
	_, err := kubeclient.CoreV1().ConfigMaps(cm.Namespace).Create(&cm)
	return err
}
