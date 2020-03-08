all_unit_tests:
	@go test ./... -v

start_kind:
	GO111MODULE="on"
	go get sigs.k8s.io/kind@v0.7.0
	kind create cluster -q
	kind get kubeconfig>${HOME}/.kube/config