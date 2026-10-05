pipeline {
    agent any

    tools {
        nodejs 'node18'
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'ShopLux - Checkout source code'
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Installing Node.js dependencies...'
                sh 'npm ci'
            }
        }

        stage('Check Project') {
            steps {
                echo 'Checking ShopLux project...'
                sh 'node --check index.js'
            }
        }

        stage('Build Docker Image') {
            steps {
                echo 'Checking Docker build configuration...'
                sh 'test -f Dockerfile'
                sh 'test -f docker-compose.yml'
            }
        }
    }

    post {
        success {
            echo 'ShopLux CI pipeline SUCCESS'
        }

        failure {
            echo 'ShopLux CI pipeline FAILED'
        }
    }
}