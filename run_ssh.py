import paramiko
import os
import sys


def run_command(host, port, username, key_path, command):
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect(host, port, username, key_filename=key_path)
        stdin, stdout, stderr = client.exec_command(command, get_pty=True)

        # Read the output line by line as it is generated
        while True:
            line = stdout.readline()
            if not line:
                break
            print(line, end="")

        print(stderr.read().decode())
        exit_status = stdout.channel.recv_exit_status()
        print(f"Exit status: {exit_status}")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python run_ssh.py <command>")
        sys.exit(1)

    cmd = sys.argv[1]
    host = os.environ.get("VPS_HOST", "76.13.96.107")
    port = 22
    username = "root"
    key_path = os.path.expanduser("~/.ssh/id_ed25519_myclaw")
    run_command(host, port, username, key_path, cmd)
