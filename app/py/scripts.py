import sys
import docker
import json

client = docker.from_env()


def get_networks(args):
    all_containers = client.containers.list(all=True)
    networks = client.networks.list()
    result_list = list(map(lambda n: {'name': n.name, 'id': n.id, 'containers': []}, networks))

    network_id_map = {}
    for i, val in enumerate(result_list):
        network_id_map[val['id']] = i

    for container in all_containers:
        belonging_networks = container.attrs.get('NetworkSettings').get('Networks')
        for i in belonging_networks:
            result_list_index = belonging_networks[i]['NetworkID']
            network = network_id_map.get(result_list_index)
            if network is None:
                continue  # Network this container used to belong to does not exist anymore, or its id changed.
            result_list[network]['containers'].append({
                'id': container.id,
                'name': container.name,
                'status': container.status,
            })

    print(json.dumps({"networks": sorted(result_list, key=lambda e: e['name'])}))


def get_network(args):
    network = client.networks.get(args['network_id'])
    data = {
        'name': network.name,
        'addressConfig': network.attrs.get('IPAM').get('Config')
    }
    print(json.dumps(data))


def remove_network(args):
    try:
        network = client.networks.get(args['network_id'])
        network.remove()
        print(network.name + " successfully removed")
    except docker.context.api.errors.APIError as err:
        print(err.explanation, file=sys.stderr)


def create_network(args):
    try:
        network = client.networks.create(
            name=args.get('name'),
            check_duplicate=True,
            scope='local'
        )
        data = {
            'ip': network.id,
            'name': network.name,
            'addressConfig': network.attrs.get('IPAM').get('Config')
        }
        print(data)
    except docker.context.api.errors.APIError as err:
        print(err.explanation, file=sys.stderr)


def get_container(args):
    container = client.containers.get(args['container_id'])
    data = {
        'name': container.name,
        'image': container.attrs['Config']['Image'],
        'ports': container.ports,
        'status': container.status,
        'networks': container.attrs['NetworkSettings']['Networks'],
        'env': container.attrs['Config']['Env'],
        'volumes': container.attrs['Config']['Volumes'],
        'volumeBinds': container.attrs['HostConfig']['Binds'],
        'cmd': container.attrs['Config']['Cmd']
    }
    print(json.dumps(data))


def remove_container(args):
    try:
        container = client.containers.get(args['container_id'])
        container.remove(v=False, link=False, force=True)
        print(container.name + " successfully removed")
    except docker.context.api.errors.APIError as err:
        print(err.explanation, file=sys.stderr)


def stop_container(args):
    try:
        container = client.containers.get(args['container_id'])
        container.stop()
        print(container.name + " successfully stopped")
    except docker.context.api.errors.APIError as err:
        print(err.explanation, file=sys.stderr)


def start_container(args):
    try:
        container = client.containers.get(args['container_id'])
        container.start()
        print(container.name + " successfully removed")
    except docker.context.api.errors.APIError as err:
        print(err.explanation, file=sys.stderr)


def get_container_logs(args):
    from datetime import datetime, timedelta, timezone
    now = datetime.now()
    yesterday = (now - timedelta(days=1)).astimezone(tz=timezone.utc).timestamp()
    container = client.containers.get(args['container_id'])
    print(container.logs(until=int(now.utcnow().timestamp()), since=int(yesterday)).decode('UTF-8'))
    for data in container.logs(stream=True, since=int(now.utcnow().timestamp())):
        print(data.decode('UTF-8'), flush=True)


def create_container(args):
    try:
        container = client.containers.run(**args['data'])
        print(container)
    except docker.context.api.errors.APIError as err:
        print(err.explanation, file=sys.stderr)


def ps():
    return client.containers.list()


def get_images(args):
    images = []
    for image in client.images.list():
        if len(image.tags) != 0:
            images.append({'tags': image.tags, 'id': image.id})
    print(json.dumps({"images": images}))


if __name__ == '__main__':
    globals()[sys.argv[1]](json.loads(sys.argv[2]))
