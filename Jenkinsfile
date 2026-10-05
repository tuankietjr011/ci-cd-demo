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
                stage('Deploy AWS EC2') {
    steps {
        echo 'Deploying ShopLux to AWS EC2...'

        sshagent(credentials: ['shoplux-ec2-key']) {
            sh '''
                mkdir -p ~/.ssh
                ssh-keyscan -H 13.250.52.12 >> ~/.ssh/known_hosts

                ssh ubuntu@13.250.52.12 '
                    cd ~/ci-cd-demo &&
                    git pull origin main &&
                    docker compose up --build -d &&
                    docker compose ps
                '
            '''
        }
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