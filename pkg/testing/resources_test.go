package util

import (
	"io/ioutil"
	"testing"

	"github.com/viveksinghggits/kuui/pkg/util"
	"sigs.k8s.io/yaml"

	. "gopkg.in/check.v1"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
)

const (
	testNS = "testns"
)

type TestCM struct {
	Name string
	Data map[string]string
}

type TestSecret struct {
	Name string
	Data map[string]string
}

type TestData struct {
	Configmaps []TestCM
	Secrets    []TestSecret
}

func Test(t *testing.T) {
	TestingT(t)
}

type unitTestSuite struct {
	kubeclient *kubernetes.Clientset
	configMaps []TestCM
	secrets    []TestSecret
	testNS     string
}

var _ = Suite(&unitTestSuite{
	kubeclient: loadConfig("${HOME}/.kube/config"),
	testNS:     testNS,
})

func (unit *unitTestSuite) SetUpSuite(c *C) {

	c.Logf("Read the test data")
	data, err := readTestData()
	c.Assert(err, IsNil)
	unit.configMaps = data.Configmaps
	unit.secrets = data.Secrets

	err = unit.CreateTestNS()
	c.Assert(err, IsNil)

	c.Logf("Creating test configmaps")
	err = unit.createTestConfigMaps(data)
	c.Assert(err, IsNil)

	c.Logf("Creating test secrets")
	err = unit.createTestSecrets(data)
	c.Assert(err, IsNil)
}

func (unit *unitTestSuite) TestGetConfigMapsOfNS(c *C) {
	c.Logf("Listing all the configmaps")
	configmaps := util.GetConfigMapsOfNS(unit.kubeclient, unit.testNS)
	if len(configmaps) != 3 {
		c.Fail()
	}
}

func (unit *unitTestSuite) createTestConfigMaps(data TestData) error {
	for _, v := range unit.configMaps {
		cm := corev1.ConfigMap{
			ObjectMeta: metav1.ObjectMeta{
				Name:      v.Name,
				Namespace: unit.testNS,
			},
			TypeMeta: metav1.TypeMeta{
				Kind: "ConfigMap",
			},
			Data: v.Data,
		}
		_, err := unit.kubeclient.CoreV1().ConfigMaps(unit.testNS).Create(&cm)
		if err != nil {
			return err
		}
	}
	return nil
}

func (unit *unitTestSuite) createTestSecrets(data TestData) error {
	return nil
}

func readTestData() (TestData, error) {
	data, err := ioutil.ReadFile("./testdata/data.yaml")
	if err != nil {
		return TestData{}, err
	}

	tData := TestData{}
	err = yaml.Unmarshal(data, &tData)
	if err != nil {
		return TestData{}, err
	}

	return tData, nil
}

func (unit *unitTestSuite) CreateTestNS() error {
	ns := corev1.Namespace{
		TypeMeta: metav1.TypeMeta{
			Kind: "Namespace",
		},
		ObjectMeta: metav1.ObjectMeta{
			Name: unit.testNS,
		},
	}
	_, err := unit.kubeclient.CoreV1().Namespaces().Create(&ns)
	return err
}

func (unit *unitTestSuite) TearDownSuite(c *C) {
	err := unit.kubeclient.CoreV1().Namespaces().Delete(unit.testNS, &metav1.DeleteOptions{})
	c.Assert(err, IsNil)
}
