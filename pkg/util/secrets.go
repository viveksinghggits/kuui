package util

import (
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/klog"
)

func GetSecretsOfNS(kubeclient *kubernetes.Clientset, namespace string) []corev1.Secret {
	secrets, err := kubeclient.CoreV1().Secrets(namespace).List(metav1.ListOptions{})
	if err != nil {
		klog.Fatalf("Error getting the secrets from a namespace %s", err.Error())
	}

	return secrets.Items
}

func GetSecretData(kubeclient *kubernetes.Clientset, secreteNS, secretName string) corev1.Secret {
	secret, err := kubeclient.CoreV1().Secrets(secreteNS).Get(secretName, metav1.GetOptions{})
	if err != nil {
		klog.Fatalf("Error getting secret data %s", err.Error())
	}

	return *secret
}

func UpdateSecret(kubeclient *kubernetes.Clientset, secretNS, secretName string, secret corev1.Secret) *corev1.Secret {
	sec, err := kubeclient.CoreV1().Secrets(secretNS).Update(&secret)
	if err != nil {
		klog.Fatalf("Error updating the secret %s", err.Error())
	}

	return sec
}
