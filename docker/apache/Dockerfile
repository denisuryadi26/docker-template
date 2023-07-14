FROM php:8.1-apache
RUN echo "ServerName localhost" >> /etc/apache2/apache2.conf
RUN apt-get update
RUN apt-get install -y \
    git \
    zip \
    curl \
    sudo \
    unzip \
    libicu-dev \
    libbz2-dev \
    libpng-dev \
    libjpeg-dev \
    libmcrypt-dev \
    libreadline-dev \
    libfreetype6-dev \
    g++ \
    nano \
    nodejs \
    npm \
    cron

RUN docker-php-ext-install \
    bz2 \
    intl \
    bcmath \
    opcache \
    calendar \
    pdo_mysql \
    mysqli


RUN apt-get install -y \
    zlib1g-dev


RUN apt-get update && \
    apt-get install -y \
    libzip-dev \
    && docker-php-ext-install zip
# Clear cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*


#RUN apk add libpng libpng-dev libjpeg-turbo-dev libwebp-dev zlib-dev libxpm-dev gd && docker-php-ext-install gd
#RUN docker-php-ext-install-gd

RUN apt-get update && apt-get install -y \
    libfreetype6-dev \
    libjpeg62-turbo-dev \
    libpng-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) gd


# 2. set up document root for apache
COPY docker/apache/000-default.conf /etc/apache2/sites-available/000-default.conf

# 3. mod_rewrite for URL rewrite and mod_headers for .htaccess extra headers like Access-Control-Allow-Origin-
RUN a2enmod rewrite headers

# 4. start with base php config, then add extensions
RUN mv "$PHP_INI_DIR/php.ini-development" "$PHP_INI_DIR/php.ini"

# set max_execution_time
RUN echo 'max_execution_time = 120' >> "$PHP_INI_DIR/php.ini"
RUN echo 'memory_limit = 512M' >> "$PHP_INI_DIR/php.ini"
RUN echo 'upload_max_filesize = 8M' >> "$PHP_INI_DIR/php.ini"

# 5. Composer
RUN curl -sS https://getcomposer.org/installer | php
RUN mv composer.phar /usr/local/bin/composer
RUN chmod +x /usr/local/bin/composer
RUN composer self-update

COPY src/ /var/www/html/
# 6. we need a user with the same UID/GID with host user
# so when we execute CLI commands, all the host file's ownership remains intact
# otherwise command from inside container will create root-owned files and directories
ARG uid
RUN useradd -G www-data,root -u $uid -d /home/devuser devuser
RUN mkdir -p /home/devuser/.composer && \
    chown -R devuser:devuser /home/devuser


#CRON

# COPY cron/all-cron /etc/cron.d/all-cron
# RUN chmod 0644 /etc/cron.d/all-cron
# RUN crontab /etc/cron.d/all-cron


# RUN touch /var/log/cron.log
#CMD cron && tail -f /var/log/cron.log

#background mode cron service
#CMD ( crond -f -l 8 & ) && httpd -D FOREGROUND

# Enable apache modules
RUN a2enmod rewrite headers
CMD cron && /usr/sbin/apache2ctl -D FOREGROUND

EXPOSE 80
#EXPOSE 3000
