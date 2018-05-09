const gulp = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins');
const del = require('del');
const browserSync = require('browser-sync').create();
const runSequence = require('run-sequence');

const source = require('vinyl-source-stream');
const browserify = require('browserify');
const babelify = require('babelify');
//const wiredep = require('wiredep').stream;

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

var dev = false;
const port = 9000;
const compress = false;

gulp.task('styles', () => {
    return gulp.src('src/css/*.scss')
        .pipe($.plumber())
        .pipe($.if(dev, $.sourcemaps.init()))
        .pipe($.sass.sync({
            outputStyle: 'expanded',
            precision: 10,
            includePaths: ['.']
        }).on('error', $.sass.logError))
        .pipe($.autoprefixer({
            browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']
        }))
        .pipe($.if(dev, $.sourcemaps.write()))
        .pipe(gulp.dest('.tmp/css'))
        .pipe(reload({
            stream: true
        }));
})

gulp.task('scripts', () => {

    return browserify("src/js/index.js", {
            debug: dev
        })
        .transform("babelify",{ "presets": ["es2015"] })
        .bundle()
        .pipe(source('index.js'))
        .pipe(gulp.dest('.tmp/js'))
        .pipe(reload({
            stream: true
        }))
});

function lint(files) {
    return gulp.src(files)
        .pipe($.eslint({
            fix: true
        }))
        .pipe(reload({
            stream: true,
            once: true
        }))
        .pipe($.eslint.format())
        .pipe($.if(!browserSync.active, $.eslint.failAfterError()));
}

gulp.task('lint', () => {
    return lint('scr/scripts/**/*.js')
        .pipe(gulp.dest('src/scripts'));
})

gulp.task('html', ['styles', 'scripts'], () => {
    return gulp.src('src/*.html')
        .pipe($.useref({
            searchPath: ['.tmp', 'src', '.']
        }))
        .pipe($.if(/\.js$/,
          $.if(compress,$.uglify())
        ))
        .pipe($.if(/\.css$/, $.cssnano({
            safe: true,
            autoprefixer: false
        })))
        .pipe(gulp.dest('dist'));
})

// gulp.task('bower', () => {
//   gulp.src('src/*.html')
//   .pipe(wiredep())
//   .pipe(gulp.dest('src'));
// })

gulp.task('img',()=>{
  return gulp.src('src/img/*')
  .pipe(gulp.dest('dist/img'));
})


gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

gulp.task('serve', () => {
    runSequence(['clean'], ['styles', 'scripts','img'], () => {
        browserSync.init({
            https:true,
            notify: false,
            port: port,
            server: {
                baseDir: ['.tmp', 'src'],
                ui: false,
                routes: {
                    '/bower_components': 'bower_components'
                }
            }
        });
    });

    gulp.watch([
        'src/*.html',
        'src/js/**/*.js'
    ]).on('change', reload);

    gulp.watch('src/css/**/*.scss', ['styles']);
    gulp.watch('src/js/**/*.js', ['scripts']);

})

gulp.task('serve:dist', ['default'], () => {
    browserSync.init({
        notify: false,
        port: port,
        server: {
            baseDir: ['dist']
        }
    });
});

gulp.task('build', ['lint', 'html']);
gulp.task('default', () => {
    return new Promise(resolve => {
        dev = false;
        runSequence(['clean'], 'build', resolve);
    });
})
