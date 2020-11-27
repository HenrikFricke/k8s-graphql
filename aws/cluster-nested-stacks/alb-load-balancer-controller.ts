import * as cdk from '@aws-cdk/core';
import * as eks from '@aws-cdk/aws-eks';
import * as iam from '@aws-cdk/aws-iam';
import * as yaml from 'js-yaml';
import request from 'sync-request';
import { ClusterStack } from '../stacks/cluster';

const AWS_ALB_INGRESS_CONTROLLER_VERSION = 'v117';

export interface AlbLoadBalancerControllerProps extends cdk.NestedStackProps {
  cluster: eks.Cluster;
}

export class AlbLoadBalancerControllerStack extends cdk.NestedStack {
  constructor(scope: ClusterStack, id: string, props: AlbLoadBalancerControllerProps) {
    super(scope, id, props);

    const albBaseResourceBaseUrl = `https://raw.githubusercontent.com/kubernetes-sigs/aws-alb-ingress-controller/${AWS_ALB_INGRESS_CONTROLLER_VERSION}/docs/examples/`;

    const albIngressControllerPolicyUrl = `${albBaseResourceBaseUrl}iam-policy.json`;
    const albServiceAccount = props.cluster.addServiceAccount('alb-ingress-controller', {
      name: 'alb-ingress-controller',
      namespace: 'kube-system',
    });

    const policyJson = request('GET', albIngressControllerPolicyUrl).getBody();
    ((JSON.parse(policyJson as string))['Statement'] as []).forEach((statement, idx, array) => {
      albServiceAccount.addToPolicy(iam.PolicyStatement.fromJson(statement));
    });

    const rbacRoles = yaml.safeLoadAll(request('GET', `${albBaseResourceBaseUrl}rbac-role.yaml`).getBody() as string)
      .filter((rbac: any) => { return rbac['kind'] != 'ServiceAccount' });
    const albDeployment = yaml.safeLoad(request('GET', `${albBaseResourceBaseUrl}alb-ingress-controller.yaml`).getBody() as string);

    const albResources = props.cluster.addManifest('aws-alb-ingress-controller', ...rbacRoles, albDeployment);

    const albResourcePatch = new eks.KubernetesPatch(this, `alb-ingress-controller-patch-${AWS_ALB_INGRESS_CONTROLLER_VERSION}`, {
      cluster: props.cluster,
      resourceName: "deployment/alb-ingress-controller",
      resourceNamespace: 'kube-system',
      applyPatch: {
        spec: {
          template: {
            spec: {
              containers: [
                {
                  name: 'alb-ingress-controller',
                  args: [
                    '--ingress-class=alb',
                    '--feature-gates=wafv2=false',
                    `--cluster-name=${props.cluster.clusterName}`,
                    `--aws-vpc-id=${props.cluster.vpc.vpcId}`,
                    `--aws-region=${this.region}`,
                  ]
                }
              ]
            }
          }
        }
      },
      restorePatch: {
        spec: {
          template: {
            spec: {
              containers: [
                {
                  name: 'alb-ingress-controller',
                  args: [
                    '--ingress-class=alb',
                    '--feature-gates=wafv2=false',
                    `--cluster-name=${props.cluster.clusterName}`,
                  ]
                }
              ]
            }
          }
        }
      },
    });
    albResourcePatch.node.addDependency(albResources);
  }
}