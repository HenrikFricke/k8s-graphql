import * as cdk from '@aws-cdk/core';
import * as eks from '@aws-cdk/aws-eks';
import { AlbLoadBalancerControllerStack } from '../cluster-nested-stacks/alb-load-balancer-controller';

export interface ClusterStackProps extends cdk.StackProps {
  clusterName: string;
}

export class ClusterStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: ClusterStackProps) {
    super(scope, id, props);

    const cluster = new eks.Cluster(this, 'k8s-graphql-cluster', {
      version: eks.KubernetesVersion.V1_18,
      clusterName: props.clusterName,
      defaultCapacity: 0
    });

    cluster.addFargateProfile('fargate-profile', {
      selectors: [
        {
          namespace: 'default',
        },
        {
          namespace: 'kube-system',
        }
      ]
    });

    new AlbLoadBalancerControllerStack(this, 'alb-load-balaner-controller', { cluster });
  }
}