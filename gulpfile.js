const {
    src,
    dest,
    watch,
    parallel,
    series
} = require('gulp'),
    scss = require('gulp-sass'),
    concat = require('gulp-concat'),
    autoprefixer = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    del = require('del'),

    browserSync = require('browser-sync').create();

function styles() {
    return src('app/scss/style.scss')
        .pipe(scss({
            //expanded - полный формат как плагин
            //nested - отступы также как в scss
            //compact - классы в одну строку
            //compressed - конвертация в одну строку (min)
            outputStyle: 'compressed'
        }))
        .pipe(concat('style.min.css'))
        .pipe(autoprefixer({
            // условия для добавления префиксов
            overrideBrowserslist: ['last 10 version'],
            grid: true
        }))
        .pipe(dest('app/css'))
        .pipe(browserSync.stream()); // обновление страницы если возможно без перезагрузки 
}

function scripts() {
    return src([
            'node_modules/jquery/dist/jquery.js',
            'app/js/main.js'
        ])
        .pipe(concat('main.min.js'))
        .pipe(uglify())
        .pipe(dest('app/js'))
        .pipe(browserSync.stream());
}

function browsersync() {
    browserSync.init({
        server: {
            baseDir: 'app/'
        },
        notify: false // что бы не было уведомлений об обновлении
    });
}

function images() {
    return src('app/images/**/*.*')
        .pipe(imagemin([
            imagemin.gifsicle({
                interlaced: true
            }),
            imagemin.mozjpeg({
                quality: 75,
                progressive: true
            }),
            imagemin.optipng({
                optimizationLevel: 5
            }),
            imagemin.svgo({
                plugins: [{
                        removeViewBox: true
                    },
                    {
                        cleanupIDs: false
                    }
                ]
            })
        ]))
        .pipe(dest('dist/images')); // путь для сжатых файлов
}

function build() {
    return src([
            'app/**/*.html',
            'app/css/style.min.css',
            'app/js/main.min.js',
            'app/fonts/*.woff*'
        ], {
            base: 'app' // переносить с учетом структуры папок осносительно указанного
        })
        .pipe(dest('dist'));
}

function clearDist() {
    return del('dist');
}

// -----------------------------------------------------------

function watching() {
    watch(['app/scss/**/*.scss'], styles);
    watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts);
    watch(['app/**/*.html']).on('change', browserSync.reload);
}

// -----------------------------------------------------------

exports.styles = styles;
exports.scripts = scripts;

exports.browsersync = browsersync;
exports.watching = watching;

exports.images = images;

exports.clearDist = clearDist;
exports.build = series(clearDist, images, build);

exports.default = parallel(styles, scripts, browsersync, watching);