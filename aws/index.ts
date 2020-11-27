#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { ClusterStack } from './stacks/cluster';

const app = new cdk.App();
const clusterName = process.env.CLUSTER_NAME || 'eks-k8s-graphql';

new ClusterStack(app, 'k8s-graphql-cluster', { clusterName });