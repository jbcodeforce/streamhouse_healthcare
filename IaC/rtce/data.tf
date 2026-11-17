data "terraform_remote_state" "ccloud" {
  backend = "local"
  config = {
    path = "../ccloud/terraform.tfstate"
  }
}
