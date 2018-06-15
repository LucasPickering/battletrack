#!/usr/bin/env groovy

pipeline {
    agent none

    stages {
        stage('Test Python') {
            agent {
                dockerfile {
                    filename 'Dockerfile.test'
                    args '-u root'
                }
            }
            steps {
                echo 'Testing Python...'
                sh 'service postgresql start'
                dir('backend/') {
                    sh 'pip install -r requirements.txt'
                    sh 'sleep 10 && python manage.py test'
                }
            }
        }
        stage('Test JS') {
            agent {
                docker {
                    image 'node'
                    args '-u root'
                }
            }
            steps {
                echo 'Testing JS...'
                dir('frontend/') {
                    sh 'npm install'
                    sh 'CI=true npm test'
                }
            }
        }
    }
}
