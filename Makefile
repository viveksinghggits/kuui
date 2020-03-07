all_unit_tests:
	@go test ./... -v

start_kind:
	GO111MODULE="on"
	go get sigs.k8s.io/kind@v0.7.0
	kind create cluster
	kind get kubeconfig>/home/user/work/temp/.kube/config