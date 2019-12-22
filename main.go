package main

import (
	"encoding/json"
	"net/http"

	"flag"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"github.com/viveksinghggits/kuui/pkg/util"
	corev1 "k8s.io/api/core/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/tools/clientcmd"
	"k8s.io/klog"
)

const (
	configMapBaseURL  = "/configs"
	secretBaseURL     = "/secrets"
	namespacesBaseURL = "/namespaces"
)

var (
	masterURL  string
	kubeconfig string
	kubeclient *kubernetes.Clientset
)

func main() {
	klog.Info("Main Called")
	flag.Parse()
	config, err := clientcmd.BuildConfigFromFlags(masterURL, kubeconfig)
	if err != nil {
		klog.Fatalf("Error while building config from flag: %s", err.Error())
	}
	kubeclient, err = kubernetes.NewForConfig(config)
	if err != nil {
		klog.Fatalf("Error while getting clientset from config: %s", err.Error())
	}

	router := mux.NewRouter()
	router.HandleFunc(namespacesBaseURL, getNamespaces).Methods("GET")
	router.HandleFunc(configMapBaseURL+"/{cmns}", getConfigMapsOfNS).Methods("GET")
	router.HandleFunc(configMapBaseURL+"/{cmns}/{cmname}", getConfigMap).Methods("GET")
	router.HandleFunc(configMapBaseURL+"/{cmns}/{cmname}", updateConfigMap).Methods("PUT")

	router.HandleFunc(secretBaseURL+"/{secretns}", getSecretsOfNS).Methods("GET")
	router.HandleFunc(secretBaseURL+"/{secretns}/{secretname}", getSecretData).Methods("GET")
	router.HandleFunc(secretBaseURL+"/{secretns}/{secretname}", updateSecret).Methods("PUT")

	http.ListenAndServe(":8000",
		handlers.CORS(handlers.AllowedHeaders([]string{"X-Requested-With", "Content-Type", "Authorization"}),
			handlers.AllowedMethods([]string{"GET", "POST", "PUT", "HEAD", "OPTIONS"}),
			handlers.AllowedOrigins([]string{"*"}))(router))
}

func updateSecret(res http.ResponseWriter, req *http.Request) {
	pathParams := mux.Vars(req)
	secretName := pathParams["secretname"]
	secretNS := pathParams["secretns"]

	var secret corev1.Secret
	json.NewDecoder(req.Body).Decode(&secret)
	json.NewEncoder(res).Encode(util.UpdateSecret(kubeclient, secretNS, secretName, secret))
}

func getSecretData(res http.ResponseWriter, req *http.Request) {
	queryParams := mux.Vars(req)
	secretName := queryParams["secretname"]
	secretNS := queryParams["secretns"]

	json.NewEncoder(res).Encode(util.GetSecretData(kubeclient, secretNS, secretName))
}

func getSecretsOfNS(res http.ResponseWriter, req *http.Request) {
	queryParams := mux.Vars(req)
	namespace := queryParams["secretns"]
	json.NewEncoder(res).Encode(util.GetSecretsOfNS(kubeclient, namespace))
}

func getConfigMapsOfNS(res http.ResponseWriter, req *http.Request) {
	queryParams := mux.Vars(req)
	namespace := queryParams["cmns"]
	json.NewEncoder(res).Encode(util.GetConfigMapsOfNS(kubeclient, namespace))
}

func getNamespaces(res http.ResponseWriter, req *http.Request) {
	json.NewEncoder(res).Encode(util.GetNamespaces(kubeclient))
}

func getConfigMap(res http.ResponseWriter, req *http.Request) {
	queryParams := mux.Vars(req)
	cmName := queryParams["cmname"]
	cmns := queryParams["cmns"]

	json.NewEncoder(res).Encode(util.GetConfigMap(kubeclient, cmns, cmName))
}

func updateConfigMap(res http.ResponseWriter, req *http.Request) {
	queryParams := mux.Vars(req)
	cmName := queryParams["cmname"]
	cmns := queryParams["cmns"]

	var configmap corev1.ConfigMap
	json.NewDecoder(req.Body).Decode(&configmap)

	json.NewEncoder(res).Encode(util.UpdateConfigMap(kubeclient, cmns, cmName, configmap))

}
func listConfigMaps(res http.ResponseWriter, req *http.Request) {
	klog.Infof("handleConfigMap was called with query %s", req.URL.Query())
	json.NewEncoder(res).Encode(util.ListConfigMaps(kubeclient))
}

func init() {
	flag.StringVar(&kubeconfig, "kubeconfig", "", "Path to your kubeconfig file.")
	flag.StringVar(&masterURL, "masterurl", "", "URL of your kube-apiserver.")
}
