const yaml = require('yaml');

const convertServers = bungeeServers => {
  const serverNames = Object.keys(bungeeServers);
  const servers = {};

  serverNames.forEach(name => {
    const address = bungeeServers[name].address;

    servers[name] = address;
  });

  return servers;
};

function convert(rawBungeeConfig) {
  const bungeeConfig = yaml.parse(rawBungeeConfig);
  const firstListener = bungeeConfig.listeners[0];

  return createVelocityConfig({
    bind: firstListener.host,
    motd: firstListener.motd,
    showMaxPlayers: firstListener.max_players,
    onlineMode: bungeeConfig.online_mode,
    announceForge: bungeeConfig.forge_support,
    servers: convertServers(bungeeConfig.servers || {}),
    tryServers: firstListener.priorities,
    compressionThreshold: bungeeConfig.network_compression_threshold,
    loginRateLimit: bungeeConfig.connection_throttle,
    queryEnabled: firstListener.query_enabled,
    queryPort: firstListener.query_port
  });
}

const formatServers = servers => {
  const serverNames = Object.keys(servers);

  return serverNames
    .map(name => {
      const address = servers[name];

      return `${name} = "${address}"`;
    })
    .join('\n');
};

const formatTryList = serverList =>
  serverList.map(serverName => `"${serverName}"`).join(',\n    ');

function createVelocityConfig({
  bind = '0.0.0.0:25577',
  motd = '&3A Velocity Server',
  showMaxPlayers = 500,
  onlineMode = true,
  announceForge = false,
  servers = {},
  tryServers = [],
  compressionThreshold = 256,
  loginRateLimit = 3000,
  queryEnabled = false,
  queryPort = 25577
}) {
  return `
# What port should the proxy be bound to? By default, we'll bind to all addresses on port 25577.
bind = "${bind}"

# What should be the MOTD? Legacy color codes and JSON are accepted.
motd = "${motd}"

# What should we display for the maximum number of players? (Velocity does not support a cap
# on the number of players online.)
show-max-players = ${showMaxPlayers}

# Should we authenticate players with Mojang? By default, this is on.
online-mode = ${onlineMode}

# Should we forward IP addresses and other data to backend servers?
# Available options:
# - "none":   No forwarding will be done. All players will appear to be connecting from the proxy
#             and will have offline-mode UUIDs.
# - "legacy": Forward player IPs and UUIDs in BungeeCord-compatible fashion. Use this if you run
#             servers using Minecraft 1.12 or lower.
# - "modern": Forward player IPs and UUIDs as part of the login process using Velocity's native
#             forwarding. Only applicable for Minecraft 1.13 or higher.
player-info-forwarding = "legacy"

# If you are using modern IP forwarding, configure an unique secret here.
player-info-forwarding-secret = "5up3r53cr3t"

# Announce whether or not your server supports Forge/FML. If you run a modded server, we suggest turning this on.
announce-forge = ${announceForge}

[servers]
# Configure your servers here.
${formatServers(servers)}

# In what order we should try servers when a player logs in or is kicked from a server.
try = [
    ${formatTryList(tryServers)}
]

[advanced]
# How large a Minecraft packet has to be before we compress it. Setting this to zero will compress all packets, and
# setting it to -1 will disable compression entirely.
compression-threshold = ${compressionThreshold}

# How much compression should be done (from 0-9). The default is -1, which uses zlib's default level of 6.
compression-level = -1

# How fast (in miliseconds) are clients allowed to connect after the last connection? Default: 3000
# Disable by setting to 0
login-ratelimit = ${loginRateLimit}

# Specify a custom timeout for connection timeouts here. The default is five seconds.
connection-timeout = 5000

# Specify a read timeout for connections here. The default is 30 seconds.
read-timeout = 30000

# Enables compatibility with HAProxy.
proxy-protocol = false

[query]
# Whether to enable responding to GameSpy 4 query responses or not.
enabled = ${queryEnabled}

# If query is enabled, on what port should the query protocol listen on?
port = ${queryPort}

# This is the map name that is reported to the query services.
map = "Velocity"

# Whether plugins should be shown in query response by default or not
show-plugins = false
`.trim();
}

module.exports = convert;
