all_unit_tests:
	@go test ./... -v -count=1

start_kind:
	GO111MODULE="on"
	go get sigs.k8s.io/kind@v0.7.0
	@echo "Starting kind cluster"
	@kind create cluster -q
	kind get kubeconfig>${HOME}/.kube/config
stop_kind:
	@echo "Stopping the kind cluster"
	@kind delete cluster