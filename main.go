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
	router.HandleFunc(configMapBaseURL+"/{cmns}/{cmname}", deleteConfigMap).Methods("DELETE")
	router.HandleFunc(configMapBaseURL, createConfigMap).Methods("POST")

	router.HandleFunc(secretBaseURL+"/{secretns}", getSecretsOfNS).Methods("GET")
	router.HandleFunc(secretBaseURL+"/{secretns}/{secretname}", getSecretData).Methods("GET")
	router.HandleFunc(secretBaseURL+"/{secretns}/{secretname}", updateSecret).Methods("PUT")
	router.HandleFunc(secretBaseURL+"/{secretns}/{secretname}", deleteSecret).Methods("DELETE")
	router.HandleFunc(secretBaseURL, createSecret).Methods("POST")

	hostPort := ":8000"
	// allow CORS
	klog.Infof("Endpoint is http://localhost%s", hostPort)
	err = http.ListenAndServe(hostPort,
		handlers.CORS(handlers.AllowedHeaders([]string{"X-Requested-With", "Content-Type", "Authorization"}),
			handlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS"}),
			handlers.AllowedOrigins([]string{"*"}))(router))
	if err != nil {
		klog.Fatalf("Error %s starting the service.", err.Error())
	}

}

func createSecret(w http.ResponseWriter, r *http.Request) {
	var secret corev1.Secret
	decoder := json.NewDecoder(r.Body)
	decoder.Decode(&secret)

	res := util.CreateSecret(kubeclient, secret)

	json.NewEncoder(w).Encode(res)
}

func createConfigMap(w http.ResponseWriter, r *http.Request) {
	var configMap corev1.ConfigMap
	decoder := json.NewDecoder(r.Body)
	decoder.Decode(&configMap)

	res := util.CreateConfigMap(kubeclient, configMap)
	json.NewEncoder(w).Encode(res)
}

func deleteSecret(w http.ResponseWriter, r *http.Request) {
	pathParams := mux.Vars(r)
	secretName := pathParams["secretname"]
	secretNS := pathParams["secretns"]

	res := util.DeleteSecret(kubeclient, secretNS, secretName)
	json.NewEncoder(w).Encode(res)
}

func deleteConfigMap(w http.ResponseWriter, r *http.Request) {
	pathParams := mux.Vars(r)
	cmName := pathParams["cmname"]
	cmNS := pathParams["cmns"]
	res := util.DeleteConfigMap(kubeclient, cmNS, cmName)
	json.NewEncoder(w).Encode(res)
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
	json.NewEncoder(res).Encode(util.ListConfigMaps(kubeclient))
}

func init() {
	flag.StringVar(&kubeconfig, "kubeconfig", "", "Path to your kubeconfig file.")
	flag.StringVar(&masterURL, "masterurl", "", "URL of your kube-apiserver.")
}
