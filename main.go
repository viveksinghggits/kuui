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
	router.HandleFunc(configMapBaseURL, listConfigMaps).Methods("GET")
	router.HandleFunc(configMapBaseURL+"/{cmns}", getConfigMapsOfNS).Methods("GET")
	router.HandleFunc(configMapBaseURL+"/{cmns}/{cmname}", getConfigMap).Methods("GET")
	router.HandleFunc(configMapBaseURL+"/{cmns}/{cmname}", updateConfigMap).Methods("PUT")

	router.HandleFunc(secretBaseURL, handleSecret).Methods("GET", "POST", "PUT", "DELETE")
	http.ListenAndServe(":8000",
		handlers.CORS(handlers.AllowedHeaders([]string{"X-Requested-With", "Content-Type", "Authorization"}),
			handlers.AllowedMethods([]string{"GET", "POST", "PUT", "HEAD", "OPTIONS"}),
			handlers.AllowedOrigins([]string{"*"}))(router))
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
	klog.Info("updateConfigMap is called with %+v", req.Body)
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

func handleSecret(res http.ResponseWriter, req *http.Request) {
	if req.Method == "GET" {

	} else if req.Method == "POST" {

	} else if req.Method == "PUT" {

	} else if req.Method == "DELETE" {

	}
}
