import paramiko
import os
import sys


def fetch_file(host, port, username, key_path, remote_path, local_path):
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect(host, port, username, key_filename=key_path)
        sftp = client.open_sftp()
        sftp.get(remote_path, local_path)
        sftp.close()
        print("Success")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python fetch_ssh.py <remote_path> <local_path>")
        sys.exit(1)

    rp = sys.argv[1]
    lp = sys.argv[2]
    host = os.environ.get("VPS_HOST", "76.13.96.107")
    port = 22
    username = "root"
    key_path = os.path.expanduser("~/.ssh/id_ed25519_myclaw")
    fetch_file(host, port, username, key_path, rp, lp)
