pipeline {
    agent any

    environment {
        TF_IN_AUTOMATION = 'true'
        TF_CLI_ARGS = '-no-color'
    }

    stages {
        stage('Hello') {
            steps {
                echo 'Jenkins Pipeline is working!'
            }
        }
    }
}
    
